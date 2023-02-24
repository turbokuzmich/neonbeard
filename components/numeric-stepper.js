import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Number from "./number";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import noop from "lodash/noop";

export default function NumbericStepper({
  value = 1,
  min = 1,
  max = Number.MAX_VALUE,
  inc = noop,
  dec = noop,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Button
        disabled={value === min}
        variant="outlined"
        size="medium"
        onClick={dec}
        sx={{
          pl: 0,
          pr: 0,
          width: 42,
          minWidth: 0,
        }}
      >
        <RemoveIcon />
      </Button>
      <Typography
        sx={{
          minWidth: 45,
          userSelect: "none",
          textAlign: "center",
        }}
      >
        <Number value={value} />
      </Typography>
      <Button
        disabled={value === max}
        variant="outlined"
        size="medium"
        onClick={inc}
        sx={{
          pl: 0,
          pr: 0,
          width: 42,
          minWidth: 0,
        }}
      >
        <AddIcon />
      </Button>
    </Box>
  );
}
