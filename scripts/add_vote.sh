#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME add_vote '{"candidateId": "dev-1637791661921-99278179986225", "comment": "I beleive that guy!"}' --accountId $CONTRACT_NAME