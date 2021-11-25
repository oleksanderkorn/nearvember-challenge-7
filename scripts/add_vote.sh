#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME add_vote "{\"electionId\": 3770048753, \"candidateId\": \"$CONTRACT_NAME\", \"comment\": \"I beleive that guy!\"}" --accountId $CONTRACT_NAME