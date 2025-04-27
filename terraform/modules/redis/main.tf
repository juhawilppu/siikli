resource "aws_elasticache_replication_group" "valkey" {
  replication_group_id          = "siikli-valkey"
  engine                        = "valkey"
  engine_version                = "7.2"
  node_type                     = "cache.t4g.micro"
  num_node_groups               = 1
  replicas_per_node_group       = 0
  port                          = 6379

  description = "Valkey cluster for Siikli"

  subnet_group_name             = var.valkey_subnet_group_name
  security_group_ids            = [var.valkey_sg_id]

  automatic_failover_enabled    = false  # Single node (no failover)
  multi_az_enabled              = false  # Single AZ
  at_rest_encryption_enabled    = false
  transit_encryption_enabled    = false

  tags = {
    Name = "siikli-valkey"
  }
}
