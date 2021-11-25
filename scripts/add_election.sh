#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME add_election '{"title": "First election!", "description": "Testing the election model."}' --accountId $CONTRACT_NAME