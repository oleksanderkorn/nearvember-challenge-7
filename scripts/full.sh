#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME new --accountId $CONTRACT_NAME
near view $CONTRACT_NAME get_votes
near view $CONTRACT_NAME get_candidates
near call $CONTRACT_NAME add_candidacy '{"name": "Donald Duck", "slogan": "Make river great again!", "goals": "Do good, do not do bad!"}' --accountId $CONTRACT_NAME
near view $CONTRACT_NAME get_candidates
near call $CONTRACT_NAME add_vote '{"candidateId": "dev-1637793298850-71625465552857", "comment": "I beleive that guy!"}' --accountId $CONTRACT_NAME
near view $CONTRACT_NAME get_votes
