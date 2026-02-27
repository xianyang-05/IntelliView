"""
IntelliView — Code Execution & Scoring via Judge0
==================================================
Handles submission of candidate code to the Judge0 API,
runs it against predefined test cases, and calculates a score.
"""

import os
import time
import json
import base64
import requests
from typing import Optional

# ── Judge0 API config ──────────────────────────────────
JUDGE0_API_URL = os.getenv("JUDGE0_API_URL", "https://judge0-ce.p.rapidapi.com")
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY", "")
JUDGE0_API_HOST = os.getenv("JUDGE0_API_HOST", "judge0-ce.p.rapidapi.com")

# Language ID mapping for Judge0
LANGUAGE_IDS = {
    "python": 71,       # Python 3
    "python3": 71,
    "javascript": 63,   # Node.js
    "java": 62,         # Java (OpenJDK)
    "cpp": 54,          # C++ (GCC)
    "c": 50,            # C (GCC)
    "typescript": 74,   # TypeScript
}

# ── Coding Problems Bank ───────────────────────────────
CODING_PROBLEMS = {
    "easy": {
        "arrays": {
            "title": "Two Sum",
            "description": (
                "Given an array of integers `nums` and an integer `target`, "
                "return the indices of the two numbers that add up to `target`.\n\n"
                "You may assume each input has exactly one solution, "
                "and you may not use the same element twice.\n\n"
                "Example:\n"
                "  Input: nums = [2, 7, 11, 15], target = 9\n"
                "  Output: [0, 1]\n"
                "  Explanation: nums[0] + nums[1] = 2 + 7 = 9"
            ),
            "starter_code": {
                "python": "def two_sum(nums, target):\n    # Write your solution here\n    pass\n",
                "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}\n",
            },
            "test_cases": [
                {"input": "2 7 11 15\n9", "expected": "0 1"},
                {"input": "3 2 4\n6", "expected": "1 2"},
                {"input": "3 3\n6", "expected": "0 1"},
            ],
            "wrapper": {
                "python": (
                    "{code}\n\n"
                    "import sys\n"
                    "data = sys.stdin.read().split('\\n')\n"
                    "nums = list(map(int, data[0].split()))\n"
                    "target = int(data[1])\n"
                    "result = two_sum(nums, target)\n"
                    "print(' '.join(map(str, result)))\n"
                ),
                "javascript": (
                    "{code}\n\n"
                    "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n"
                    "const nums = lines[0].split(' ').map(Number);\n"
                    "const target = parseInt(lines[1]);\n"
                    "const result = twoSum(nums, target);\n"
                    "console.log(result.join(' '));\n"
                ),
            }
        },
        "strings": {
            "title": "Valid Palindrome",
            "description": (
                "Given a string `s`, determine if it is a palindrome, "
                "considering only alphanumeric characters and ignoring cases.\n\n"
                "Example:\n"
                "  Input: 'A man, a plan, a canal: Panama'\n"
                "  Output: true"
            ),
            "starter_code": {
                "python": "def is_palindrome(s):\n    # Write your solution here\n    pass\n",
                "javascript": "function isPalindrome(s) {\n    // Write your solution here\n}\n",
            },
            "test_cases": [
                {"input": "A man, a plan, a canal: Panama", "expected": "true"},
                {"input": "race a car", "expected": "false"},
                {"input": " ", "expected": "true"},
            ],
            "wrapper": {
                "python": (
                    "{code}\n\n"
                    "import sys\n"
                    "s = sys.stdin.read().strip()\n"
                    "print(str(is_palindrome(s)).lower())\n"
                ),
                "javascript": (
                    "{code}\n\n"
                    "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\n"
                    "console.log(isPalindrome(s));\n"
                ),
            }
        }
    },
    "medium": {
        "arrays": {
            "title": "Maximum Subarray",
            "description": (
                "Given an integer array `nums`, find the subarray with the largest sum "
                "and return its sum.\n\n"
                "Example:\n"
                "  Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\n"
                "  Output: 6\n"
                "  Explanation: The subarray [4, -1, 2, 1] has the largest sum = 6."
            ),
            "starter_code": {
                "python": "def max_subarray(nums):\n    # Write your solution here\n    pass\n",
                "javascript": "function maxSubArray(nums) {\n    // Write your solution here\n}\n",
            },
            "test_cases": [
                {"input": "-2 1 -3 4 -1 2 1 -5 4", "expected": "6"},
                {"input": "1", "expected": "1"},
                {"input": "5 4 -1 7 8", "expected": "23"},
            ],
            "wrapper": {
                "python": (
                    "{code}\n\n"
                    "import sys\n"
                    "nums = list(map(int, sys.stdin.read().strip().split()))\n"
                    "print(max_subarray(nums))\n"
                ),
                "javascript": (
                    "{code}\n\n"
                    "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n"
                    "console.log(maxSubArray(nums));\n"
                ),
            }
        },
        "strings": {
            "title": "Longest Substring Without Repeating Characters",
            "description": (
                "Given a string `s`, find the length of the longest substring "
                "without repeating characters.\n\n"
                "Example:\n"
                "  Input: 'abcabcbb'\n"
                "  Output: 3\n"
                "  Explanation: The answer is 'abc', with length 3."
            ),
            "starter_code": {
                "python": "def length_of_longest_substring(s):\n    # Write your solution here\n    pass\n",
                "javascript": "function lengthOfLongestSubstring(s) {\n    // Write your solution here\n}\n",
            },
            "test_cases": [
                {"input": "abcabcbb", "expected": "3"},
                {"input": "bbbbb", "expected": "1"},
                {"input": "pwwkew", "expected": "3"},
            ],
            "wrapper": {
                "python": (
                    "{code}\n\n"
                    "import sys\n"
                    "s = sys.stdin.read().strip()\n"
                    "print(length_of_longest_substring(s))\n"
                ),
                "javascript": (
                    "{code}\n\n"
                    "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\n"
                    "console.log(lengthOfLongestSubstring(s));\n"
                ),
            }
        }
    },
    "hard": {
        "arrays": {
            "title": "Merge K Sorted Lists (Array Version)",
            "description": (
                "Given k sorted arrays, merge them into one sorted array.\n\n"
                "Example:\n"
                "  Input: [[1,4,5],[1,3,4],[2,6]]\n"
                "  Output: [1,1,2,3,4,4,5,6]"
            ),
            "starter_code": {
                "python": "def merge_k_sorted(arrays):\n    # Write your solution here\n    pass\n",
            },
            "test_cases": [
                {"input": "1,4,5;1,3,4;2,6", "expected": "1 1 2 3 4 4 5 6"},
                {"input": "", "expected": ""},
                {"input": "1", "expected": "1"},
            ],
            "wrapper": {
                "python": (
                    "{code}\n\n"
                    "import sys\n"
                    "raw = sys.stdin.read().strip()\n"
                    "if not raw:\n"
                    "    print('')\n"
                    "else:\n"
                    "    arrays = [list(map(int, g.split(','))) for g in raw.split(';') if g]\n"
                    "    result = merge_k_sorted(arrays)\n"
                    "    print(' '.join(map(str, result)))\n"
                ),
            }
        }
    }
}


def get_problem(difficulty: str = "medium", topic: str = "arrays") -> Optional[dict]:
    """Retrieve a coding problem by difficulty and topic."""
    diff_problems = CODING_PROBLEMS.get(difficulty, CODING_PROBLEMS["medium"])
    problem = diff_problems.get(topic)
    if not problem:
        # Fallback to first available topic
        problem = next(iter(diff_problems.values()), None)
    return problem


def _judge0_headers() -> dict:
    """Build headers for Judge0 API requests."""
    headers = {"Content-Type": "application/json"}
    if JUDGE0_API_KEY:
        headers["X-RapidAPI-Key"] = JUDGE0_API_KEY
        headers["X-RapidAPI-Host"] = JUDGE0_API_HOST
    return headers


async def execute_code(code: str, language: str, problem: dict) -> dict:
    """
    Submit code to Judge0 against all test cases and return results.

    Returns:
        {
            "passed": int,
            "total": int,
            "score": float,  # 0.0 - 1.0
            "test_results": [...],
            "error": str | None
        }
    """
    lang_id = LANGUAGE_IDS.get(language.lower(), 71)  # default Python
    test_cases = problem.get("test_cases", [])
    wrapper_template = problem.get("wrapper", {}).get(language.lower(), "{code}")

    # Wrap candidate code with I/O handling
    full_code = wrapper_template.replace("{code}", code)

    import asyncio

    async def _run_test_case(i: int, tc: dict) -> dict:
        try:
            payload = {
                "source_code": base64.b64encode(full_code.encode()).decode(),
                "language_id": lang_id,
                "stdin": base64.b64encode(tc["input"].encode()).decode(),
                "expected_output": base64.b64encode(tc["expected"].encode()).decode(),
                "cpu_time_limit": 5,
                "memory_limit": 128000,
            }

            # Run synchronous requests.post in a background thread to allow concurrency
            def _post():
                return requests.post(
                    f"{JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true",
                    json=payload,
                    headers=_judge0_headers(),
                    timeout=30,
                )
            
            resp = await asyncio.to_thread(_post)

            if resp.status_code != 200 and resp.status_code != 201:
                return {
                    "test_case": i + 1,
                    "passed": False,
                    "error": f"Judge0 HTTP {resp.status_code}",
                    "stdout": "",
                    "expected": tc["expected"],
                }

            result = resp.json()

            # Decode outputs
            stdout = ""
            stderr = ""
            if result.get("stdout"):
                stdout = base64.b64decode(result["stdout"]).decode().strip()
            if result.get("stderr"):
                stderr = base64.b64decode(result["stderr"]).decode().strip()

            status_id = result.get("status", {}).get("id", 0)
            # Status 3 = Accepted
            is_passed = (status_id == 3) or (stdout == tc["expected"].strip())

            return {
                "test_case": i + 1,
                "passed": is_passed,
                "stdout": stdout,
                "expected": tc["expected"],
                "stderr": stderr,
                "time": result.get("time"),
                "memory": result.get("memory"),
                "status": result.get("status", {}).get("description", "Unknown"),
            }

        except Exception as e:
            return {
                "test_case": i + 1,
                "passed": False,
                "error": str(e),
                "stdout": "",
                "expected": tc["expected"],
            }

    # Run all test cases in parallel
    tasks = [_run_test_case(i, tc) for i, tc in enumerate(test_cases)]
    results = await asyncio.gather(*tasks)

    passed = sum(1 for res in results if res.get("passed"))
    total = len(test_cases)
    score = passed / total if total > 0 else 0.0

    return {
        "passed": passed,
        "total": total,
        "score": score,
        "test_results": results,
        "error": None,
    }
