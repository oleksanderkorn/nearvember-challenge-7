#!/bin/bash
source neardev/dev-account.env
near view $CONTRACT_NAME get_votes '{"electionId": 790033253}'