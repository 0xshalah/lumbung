# Aegis Vault — Conformance Verification Report

- Vault: `CDHICU2WIUHKLYPQCXD7ZD2VABMEGBR2G3TYEVC4Q5PMTCR6JHST55GI`
- Network: testnet
- Spec: SEP-0056 v0.1.2 (Draft)
- Checker: sep56-vault-guard 0.5.0 (commit 19d4180)
- Started: 2026-10-21T10:16:18.798Z
- Completed: 2026-10-21T10:17:45.293Z
- Duration: 86 s
- Result: Remediation needed
- Core function checks: 7 of 7 passed
- Basic security checks: 3 of 4 passed

## Conformance checks

| # | Check | Status | Settled at | Detail |
|---|---|---|---|---|
| 01 | Total assets accounting | PASS | 2026-10-21T10:16:44.420Z | total_assets = 122008000 |
| 02 | Deposit conformance | PASS | 2026-10-21T10:16:59.653Z | deposited 5000000 stroops, minted 5000000000 shares matching preview_deposit(), total_assets 122008000 -> 127008000; max_deposit=170141183460469231731687303715884105727, total_supply 122008000000 -> 127008000000 |
| 03 | Mint conformance | PASS | 2026-10-21T10:17:09.781Z | minted 3000000 shares, pulled 3000 assets matching preview_mint(), total_assets 127008000 -> 127011000; max_mint=170141183460469231731687303715884105727, total_supply 127008000000 -> 127011000000 |
| 04 | Withdraw conformance | PASS | 2026-10-21T10:17:30.135Z | withdrew 2000000 stroops, burned 2000000000 shares matching preview_withdraw(), total_assets 127011000 -> 125011000; max_withdraw=11007000, total_supply 127011000000 -> 125011000000 |
| 05 | Redeem conformance | PASS | 2026-10-21T10:17:40.247Z | redeemed 1000000 shares, received 1000 assets matching preview_redeem(), total_assets 125011000 -> 125010000; max_redeem=9007000000, total_supply 125011000000 -> 125010000000 |
| 06 | Convert to shares accuracy | PASS | 2026-10-21T10:17:45.293Z | convert_to_shares(4000000) = 4000000000, round-trip convert_to_assets(4000000000) = 4000000 (<= 4000000, as required of floor/floor round-tripping), total_assets unchanged at 125010000 |
| 07 | Convert to assets accuracy | PASS | 2026-10-21T10:17:45.293Z | convert_to_assets(4000000) = 4000, round-trip convert_to_shares(4000) = 4000000 (<= 4000000, as required of floor/floor round-tripping), total_assets unchanged at 125010000 |

## Security checks

| # | Check | Status | Settled at | Detail |
|---|---|---|---|---|
| 08 | Donation / inflation attack resistance | FAIL | 2026-10-21T10:17:35.186Z | VULNERABLE to donation/inflation attack — fresh vault CCF5TSELJEK3MRUCJN7EDNBQLSUDV5CP3LMM3WESTX4764ONUSJ65IWN (decimals_offset=3): attacker deposited 1 stroop(s) then donated 100000000 stroops directly (bypassing deposit()); victim then deposited 5000000 stroops and received 99 shares (0% of the 5000000000 expected from an undisturbed deposit at this vault's decimals_offset); attacker P&L: net loss of 49976180 stroops (spent 100000001, redeemed 50023821) |
| 09 | Overflow protection | PASS | 2026-10-21T10:17:04.695Z | deposit(assets=i128::MAX) on fresh vault CCZC5EF2AHL4SON3BHADATNK4ERBNHFDIXNZ6VQUG6J5FOGDDFWGM7ZN failed cleanly (rejected by the network, with no error text), and total_assets remained 0 — no silent-wrong-result observed. this vault's decimals_offset=3 means preview_deposit() computes assets * 10^3, which overflows i128 for assets=i128::MAX regardless of the underlying asset — so this IS the vault's own checked-arithmetic overflow protection (stellar-tokens' mul_div_with_rounding, which panics rather than truncating), confirmed before any asset transfer was even attempted. |
| 10 | Rounding direction safety | PASS | 2026-10-21T10:17:35.186Z | fresh vault CAS3WTKB6Z3AF4ZA6BGVGWKSYXHE7CZPR3C36MQSDPWIVO4TTZVG5QXZ at fractional ratio (seed 1000 + donation 500): Test A — deposit(100) minted 66688 shares matching preview_deposit() (floor, favors vault); Test B — mint(100 shares) pulled 1 assets matching preview_mint() (ceil) and strictly greater than the idealized convert_to_assets() (0) — rounding direction confirmed to always favor the vault over the user |
| 11 | Access control probing | PASS | 2026-10-21T10:17:35.186Z | fresh vault CDM5YY6V6ECF6N77YDKPNIAZU5VD2HN3MEINWWQJBG64ONTMVZQVGV6J (decimals_offset=3): unauthorized withdraw (no approval) correctly rejected; after owner approved operator for 1000000000 shares, operator withdrew 500000000 shares (allowance 1000000000 -> 500000000, decremented exactly); operator's over-allowance withdraw attempt of 1500000 assets (requiring more shares than the remaining 500000000-share allowance) correctly rejected with allowance left untouched at 500000000 |

_Timestamps are recorded by the browser while polling the backend every 5 s, so each is accurate to about 5 s._
