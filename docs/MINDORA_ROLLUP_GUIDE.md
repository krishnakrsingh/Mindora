# Mindora Relational Database Formulas & Rollups Guide

Mindora Bases bring Notion-like relational database functionality into a local-first workspace.

## 1. Property Types

Mindora databases support the following property types:
- `text`: Plain text strings
- `number`: Floating-point and integer numbers
- `select`: Single-choice tags with colored pills
- `multi-select`: Multiple tag selections
- `status`: Lifecycle statuses (`Not Started`, `In Progress`, `Completed`, `Blocked`)
- `date`: ISO timestamp dates
- `checkbox`: Boolean flags
- `url`: External web hyperlinks
- `email`: Email address links
- `formula`: Sandboxed computed JavaScript expressions
- `rollup`: Cross-record summary aggregations
- `relation`: Bidirectional document links

---

## 2. Formula Syntax & Built-ins

Formulas in Mindora execute in a sandboxed, pure evaluation environment:

### Accessing Properties
```javascript
prop("Status")
prop("Story Points")
prop("Title")
```

### Supported Operators
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `>`, `<`, `>=`, `<=`, `===`, `!==`
- Ternary: `condition ? ifTrue : ifFalse`

### Built-in Helper Functions
- `concat(a, b, ...)`: Join multiple strings
- `upper(str)`: Convert to UPPERCASE
- `lower(str)`: Convert to lowercase
- `length(val)`: Return string or array length
- `round(num)`: Round to nearest integer
- `abs(num)`: Absolute value
- `if(condition, thenVal, elseVal)`: Conditional branch

### Formula Examples
- **Status Indicator**: `prop("Status") === "Completed" ? "✅ Done" : "⏳ Pending"`
- **Story Point Velocity**: `prop("Story Points") * 1.5`
- **Label Capitalization**: `upper(prop("Priority")) + " - " + prop("Title")`

---

## 3. Column Rollups & Summary Footers

The bottom footer of every Table view automatically computes real-time aggregates:
- **Numbers**: Computes `Sum` and `Average`
- **Checkboxes**: Computes `Percent Checked (%)`
- **Select & Status**: Computes `Unique Count`
- **General Fields**: Computes `Total Filled Count`
