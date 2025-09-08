## Agent 4: Testing & Quality Agent
**Purpose**: Run tests, validate code quality, and ensure project integrity

**Specialized Tasks**:
- Execute all test suites automatically
- Validate data integrity and API contracts
- Check code style and standards compliance
- Generate debug reports and diagnostics
- Monitor for common issues and anti-patterns

**Key Commands**:
```bash
# Testing operations
python test_filtering.py
python test_react_filtering.py
python create_debug.py

# Quality checks
find . -name "*.py" -exec python -m py_compile {} \;
```

**Autonomy Settings**:
- Allow automatic execution of all tests
- Allow creation of debug files and reports
- Require approval for test modifications
- Allow read-only access to all project files

**Error Handling**:
- Generate comprehensive error reports
- Suggest fixes for common test failures
- Validate data schema consistency
- Check for breaking changes across components
