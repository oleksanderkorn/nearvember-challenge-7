#!/bin/bash
source neardev/dev-account.env
ELECTION_ID=59135
near call $CONTRACT_NAME add_candidacy "{\"electionId\": $ELECTION_ID, \"name\": \"Donald Duck\", \"slogan\": \"Make river great again!\", \"goals\": \"Do good, do not do bad!\"}" --accountId $CONTRACT_NAME