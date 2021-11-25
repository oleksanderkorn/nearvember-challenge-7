#!/bin/bash
source neardev/dev-account.env
near call $CONTRACT_NAME god_mode_off --accountId $CONTRACT_NAME