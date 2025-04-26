output "private_subnets" {
  value = aws_subnet.private.*.id
}

output "security_groups" {
  value = aws_security_group.alb.*.id
}   