#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME add_candidacy '{"name": "Donald Duck", "slogan": "Make river great again!", "goals": "Do good, do not do bad!"}' --accountId $CONTRACT_NAME