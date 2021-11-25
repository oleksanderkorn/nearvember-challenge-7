#!/bin/bash
source neardev/dev-account.env
ELECTION_ID=59135
near view $CONTRACT_NAME get_candidates "{\"electionId\": $ELECTION_ID}"