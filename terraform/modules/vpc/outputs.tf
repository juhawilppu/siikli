output "private_subnets" {
  value = aws_subnet.private.*.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_task.id
}   

output "db_subnets" {
  value = aws_subnet.db.*.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}
