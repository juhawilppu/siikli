resource "aws_security_group" "rds_sg" {
  name        = "siikli-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  tags = {
    Name = "siikli-rds-sg"
  }
}

resource "aws_security_group" "ecs_tasks_sg" {
  name        = "siikli-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = var.vpc_id

  tags = {
    Name = "siikli-ecs-tasks-sg"
  }
}

resource "aws_security_group_rule" "allow_ecs_to_rds" {
  type        = "ingress"
  from_port   = 5432
  to_port     = 5432
  protocol    = "tcp"
  security_group_id = aws_security_group.rds_sg.id
  source_security_group_id = aws_security_group.ecs_tasks_sg.id
}

data "aws_secretsmanager_secret" "db_password" {
  name = "siikli-db-password"
}

data "aws_secretsmanager_secret_version" "db_password_version" {
  secret_id     = data.aws_secretsmanager_secret.db_password.id
}

resource "aws_db_subnet_group" "main" {
  name       = "siikli-db-subnet-group"
  subnet_ids = var.db_subnets

  tags = {
    Name = "siikli-db-subnet-group"
  }
}

resource "aws_db_instance" "siikli" {
  identifier         = "siikli-db"
  engine             = "postgres"
  engine_version     = "17.2"
  instance_class     = "db.t4g.micro"
  allocated_storage  = 20
  max_allocated_storage = 100
  storage_type       = "gp3"

  username           = "siikli"
  password           = data.aws_secretsmanager_secret_version.db_password_version.secret_string
  db_name            = "siikli"

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  deletion_protection     = true

  publicly_accessible = false
  skip_final_snapshot = false
}
