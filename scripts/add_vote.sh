#!/bin/bash
source neardev/dev-account.env
ELECTION_ID=59135
near call $CONTRACT_NAME add_vote "{\"electionId\": $ELECTION_ID, \"candidateId\": \"$CONTRACT_NAME\", \"comment\": \"I beleive that guy!\"}" --accountId $CONTRACT_NAME