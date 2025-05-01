resource "aws_vpc" "main" {
  cidr_block = var.vpc_ip_range

  tags = {
    Name = "siikli-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "siikli-ig"
  }
}

resource "aws_subnet" "public" {
  count = length(var.public_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = element(var.public_subnets, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name = "public-subnet-${count.index}"
    Type = "public"
  }
}

resource "aws_subnet" "private" {
  count = length(var.private_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = element(var.private_subnets, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name = "private-subnet-${count.index}"
    Type = "private"
  }
}

resource "aws_subnet" "db" {
  count = length(var.db_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = element(var.db_subnets, count.index)
  availability_zone = element(var.availability_zones, count.index)

  tags = {
    Name = "db-subnet-${count.index}"
    Type = "database"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets)
  subnet_id      = element(aws_subnet.public[*].id, count.index)
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  count = 0 # Disable NAT gateway to save money
  domain = "vpc"

  tags = {
    Name = "siikli-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  count = 0 # Disable NAT gateway to save money

  allocation_id = aws_eip.nat[0].id

  # To save money, we only create one NAT gateway and use it for all public subnets
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name = "siikli-nat-gateway"
  }

  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "private" {
  count = 0 # Disable NAT gateway and private subnet to save money

  #count = length(var.private_subnets)

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[0].id
  }

  tags = {
    Name = "siikli-private-route-table-${count.index}"
  }
}

resource "aws_route_table_association" "private" {
  count = 0 # Disable NAT gateway to save money

  #count = length(var.private_subnets)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_security_group" "alb" {
  name   = "siikli-sg-alb"
  vpc_id = aws_vpc.main.id

  # Allow HTTP traffic to ALB from the internet
  ingress {
    protocol         = "tcp"
    from_port        = 80
    to_port          = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # Allow HTTPS traffic to ALB from the internet
  ingress {
    protocol         = "tcp"
    from_port        = 443
    to_port          = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # ALB needs outbound access to ECS tasks
  egress {
    protocol         = "tcp"
    from_port        = 3000
    to_port          = 3000
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "alb-sg"
  }
}

resource "aws_security_group" "ecs_task" {
  name   = "siikli-sg-ecs-task"
  vpc_id = aws_vpc.main.id

  # Allow inbound traffic from ALB on application port
  ingress {
    protocol         = "tcp"
    from_port        = 3000
    to_port          = 3000
    security_groups  = [aws_security_group.alb.id]
  }

  # Allow all outbound traffic
  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "ecs-task-sg"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "siikli-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "siikli-rds-sg"
  }
}

resource "aws_security_group_rule" "allow_ecs_to_rds" {
  type        = "ingress"
  from_port   = 5432
  to_port     = 5432
  protocol    = "tcp"
  security_group_id = aws_security_group.rds_sg.id
  source_security_group_id = aws_security_group.ecs_task.id
}

resource "aws_security_group" "valkey_sg" {
  name        = "siikli-valkey-sg"
  description = "Security group for Valkey (Redis compatible)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description              = "Allow ECS to connect to Valkey"
    from_port                = 6379
    to_port                  = 6379
    protocol                 = "tcp"
    security_groups          = [aws_security_group.ecs_task.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "siikli-valkey-sg"
  }
}

resource "aws_elasticache_subnet_group" "valkey_subnet_group" {
  name       = "siikli-valkey-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "siikli-valkey-subnet-group"
  }
}
