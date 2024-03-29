#!/usr/bin/env python3

# This script can be used to reformat the release notes generated by
# GitHub releases into a format slightly more appropriate for our
# project (ie. we don't really need to mention the author of every PR)
#
# eg. in: * OpenTelemetry by @dbkr in https://github.com/vector-im/element-call/pull/961
#    out: * OpenTelemetry (https://github.com/vector-im/element-call/pull/961)

import sys
import re

for line in sys.stdin:
    matches = re.match(r'^\* (.*) by (\S+) in (\S+)$', line.strip())
    print("* %s (%s)" % (matches[1], matches[3]))
