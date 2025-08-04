import * as React from "react";
// ...imports unchanged

// ...SmartTable definition unchanged

// In all places where unknown is rendered, cast to React.ReactNode
// For example:
{flexRender(cell.column.columnDef.cell, cell.getContext()) as React.ReactNode}