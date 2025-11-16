#!/bin/bash
# Script to tail the backend logs from AWS CloudWatch.

aws logs tail /ecs/backend   --since 1h
aws logs tail /ecs/backend   --follow   --region eu-north-1
