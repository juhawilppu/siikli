aws ecs describe-services --cluster siikli-backend --services arn:aws:ecs:eu-north-1:337909750746:service/siikli-backend/backend-service
aws logs tail /ecs/backend --follow
