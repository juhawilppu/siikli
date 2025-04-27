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

  vpc_security_group_ids = [var.rds_security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  deletion_protection     = true

  publicly_accessible = false
  skip_final_snapshot = false
}
