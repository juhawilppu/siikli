resource "aws_backup_vault" "compliance_vault" {
  name = "siikli-compliance-vault"
}

resource "aws_backup_vault_lock_configuration" "vault_lock" {
  backup_vault_name   = aws_backup_vault.compliance_vault.name
  min_retention_days  = 2
  max_retention_days  = 365
  changeable_for_days = 7
}

resource "aws_backup_plan" "hourly_plan" {
  name = "siikli-hourly-plan"

  rule {
    rule_name         = "hourly"
    target_vault_name = aws_backup_vault.compliance_vault.name
    schedule          = "cron(0 * * * ? *)"  # Every hour on the hour (UTC)
    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = 2 # days
    }
  }
}

resource "aws_backup_plan" "daily_plan" {
  name = "siikli-daily-plan"

  rule {
    rule_name         = "daily"
    target_vault_name = aws_backup_vault.compliance_vault.name
    schedule          = "cron(0 5 * * ? *)"  # Every day at 05:00 UTC
    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = 90 # days
    }
  }
}

resource "aws_backup_selection" "hourly_selection" {
  name         = "siikli-hourly-selection"
  iam_role_arn = aws_iam_role.backup_role.arn
  plan_id      = aws_backup_plan.hourly_plan.id

  resources = [var.db_arn]
}

resource "aws_backup_selection" "daily_selection" {
  name         = "siikli-daily-selection"
  iam_role_arn = aws_iam_role.backup_role.arn
  plan_id      = aws_backup_plan.daily_plan.id

  resources = [var.db_arn]
}

resource "aws_iam_role" "backup_role" {
  name = "aws-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "backup.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backup_policy" {
  role       = aws_iam_role.backup_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}
