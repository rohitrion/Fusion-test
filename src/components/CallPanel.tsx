"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";

import { CallPanelProps } from "./types";
import { Actions, Wrapper } from "./CallPanel.styles";

export default function CallPanel({
  callState,
  incomingFrom,
  onCall,
  onAccept,
  onHangup,
}: CallPanelProps) {
  const [number, setNumber] = useState<string>("");

  if (callState === "RINGING") {
    return (
      <Wrapper>
        <div>Incoming call: {incomingFrom}</div>
        <Actions>
          <Button variant="contained" color="success" onClick={onAccept}>
            Accept
          </Button>
          <Button variant="outlined" color="error" onClick={onHangup}>
            Reject
          </Button>
        </Actions>
      </Wrapper>
    );
  }

  if (callState === "CALLING" || callState === "IN_CALL") {
    return (
      <Wrapper>
        <div>{callState === "CALLING" ? "Calling..." : "In call"}</div>
        <Button variant="contained" color="error" onClick={onHangup}>
          Hang up
        </Button>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <TextField
        label="Number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        disabled={!number.trim()}
        onClick={() => onCall(number)}
      >
        Call
      </Button>
    </Wrapper>
  );
}
