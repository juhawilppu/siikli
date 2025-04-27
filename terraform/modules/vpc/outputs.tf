output "private_subnets" {
  value = aws_subnet.private.*.id
}

output "public_subnets" {
    value = aws_subnet.public.*.id
}

output "db_subnets" {
  value = aws_subnet.db.*.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "rds_security_group_id" {
  value = aws_security_group.rds_sg.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_task.id
}

output "alb_sg_id" {
  value = aws_security_group.alb.id
}

output "valkey_subnet_group_name" {
  value = aws_elasticache_subnet_group.valkey_subnet_group.name
}

output "valkey_sg_id" {
  value = aws_security_group.valkey_sg.id
}
