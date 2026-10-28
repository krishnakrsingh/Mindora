# Mindora Licensing Audit & Code Provenance Gate

## 1. Executive Summary & Policy

Mindora is released under the **MIT License**. To maintain complete legal cleanliness and commercial viability without viral license encumbrances:
1. **Permissive Inclusions Only**: Only MIT, Apache-2.0, or BSD licensed code may be directly incorporated into Mindora.
2. **AGPL Isolation**: All GNU Affero General Public License (AGPL-3.0) repositories are strictly quarantined to `research/upstream/` for conceptual and architectural analysis. **No AGPL code is copied into Mindora.**
3. **No Upstream Brand Usage**: Upstream product names, trademarks, and logos are strictly excluded. Mindora has its own brand identity, visual system, and terminology.
4. **Third-Party Attribution**: Every borrowed component carries explicit copyright notices, origin links, and preserved license files in `THIRD_PARTY_LICENSES/`.

---

## 2. Upstream Repository Audit Matrix

| Repository | Upstream License | Eligibility for Direct Inclusion | Action Taken |
|---|---|---|---|
| **Folio** | MIT | **Eligible** | Selected as core document, base, and canvas UI foundation. |
| **Atomic** | MIT | **Eligible** | Reused for AI semantic retrieval, multi-provider LLM abstraction, and hybrid search. |
| **NoteDiscovery** | MIT | **Eligible** | Reused for Obsidian compatibility, graph algorithms, and wikilink resolution. |
| **SilverBullet** | MIT | **Eligible** | Reused for query syntax patterns and metadata structures. |
| **AFFiNE (BlockSuite)** | Mixed / MIT (BlockSuite) | **Eligible (selective)** | Reused block concepts and canvas interaction ideas. Cloud/enterprise server excluded. |
| **AppFlowy / AppFlowy-Web** | AGPL-3.0 | **Ineligible (Excluded)** | Quarantined in `research/upstream/`. Studied for database UX patterns only. |
| **Docmost** | AGPL-3.0 | **Ineligible (Excluded)** | Quarantined in `research/upstream/`. Studied for collaboration flow patterns only. |
| **SiYuan** | AGPL-3.0 | **Ineligible (Excluded)** | Quarantined in `research/upstream/`. Studied for block reference schema only. |
| **Logseq** | AGPL-3.0 | **Ineligible (Excluded)** | Quarantined in `research/upstream/`. Studied for linked references and graph query patterns only. |

---

## 3. License Texts Verified
- `THIRD_PARTY_LICENSES/FOLIO_LICENSE.txt` (Evergreen / Folio contributors, MIT)
- `THIRD_PARTY_LICENSES/ATOMIC_LICENSE.txt` (Kenneth Bergquist, MIT)
- `THIRD_PARTY_LICENSES/NOTEDISCOVERY_LICENSE.txt` (Gamosoft, MIT)
- `THIRD_PARTY_LICENSES/SILVERBULLET_LICENSE.txt` (Zef Hemel, MIT)
- `THIRD_PARTY_LICENSES/AFFINE_BLOCKSUITE_LICENSE.txt` (TOEVERYTHING PTE. LTD., MIT)

---

## 4. Verification Check
- No GPL or AGPL headers exist anywhere in Mindora's production code.
- `package.json` specifies `"license": "MIT"`.
- Production bundle includes no upstream research repositories.

