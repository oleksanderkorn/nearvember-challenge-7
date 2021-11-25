#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME add_election '{"title": "First election!", "description": "Testing the election model.", "startDate": "0", "endDate": "0"}' --accountId $CONTRACT_NAME