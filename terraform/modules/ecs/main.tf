resource "aws_iam_role" "ecs_task_execution" {
  name = "ecs-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_ecr" {
  name = "ecs-task-execution-ecr"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "secretsmanager:GetSecretValue"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/backend"
  retention_in_days = 30
}

data "aws_secretsmanager_secret" "ecs_secrets" {
  name = "ecs-secrets"
}

data "aws_secretsmanager_secret_version" "ecs_secrets_version" {
  secret_id     = data.aws_secretsmanager_secret.ecs_secrets.id
}

resource "aws_ecs_cluster" "main" {
  name = "siikli-backend"
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "backend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "337909750746.dkr.ecr.eu-north-1.amazonaws.com/siikli-backend:${var.app_version}"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
            name = "cache"
            value = "3"
        },
        {
            name = "PRIMARY_URL"
            value = "https://v2.siikli.fi"
        }   
      ]
      secrets = [
        {
          name = "DATABASE_URL"
          valueFrom = "${data.aws_secretsmanager_secret_version.ecs_secrets_version.arn}:DATABASE_URL::"
        },
        {
          name = "SESSION_SECRET"
          valueFrom = "${data.aws_secretsmanager_secret_version.ecs_secrets_version.arn}:SESSION_SECRET::"
        },
        {
          name = "REDIS_URL"
          valueFrom = "${data.aws_secretsmanager_secret_version.ecs_secrets_version.arn}:REDIS_URL::"
        },
        {
          name = "GOOGLE_CLIENT_ID"
          valueFrom = "${data.aws_secretsmanager_secret_version.ecs_secrets_version.arn}:GOOGLE_CLIENT_ID::"
        },
        {
          name = "GOOGLE_CLIENT_SECRET"
          valueFrom = "${data.aws_secretsmanager_secret_version.ecs_secrets_version.arn}:GOOGLE_CLIENT_SECRET::"
        },
        {
          name = "SENTRY_DSN"
          valueFrom = "${data.aws_secretsmanager_secret_version.ecs_secrets_version.arn}:SENTRY_DSN::"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = "eu-north-1"
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ecs_task_role_policy" {
  name = "ecs-task-role-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel",
          "secretsmanager:GetSecretValue",
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    #subnets          = var.private_subnets
    subnets          = var.public_subnets # Disabled NAT gateway and private subnets to save money
    assign_public_ip = true

    security_groups  = [var.ecs_security_group_id]
  }

  load_balancer {
    target_group_arn = var.alb_target_group_arn
    container_name   = "backend"
    container_port   = 3000
  }

  enable_execute_command = true
  enable_ecs_managed_tags = true
}
