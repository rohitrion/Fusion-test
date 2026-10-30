"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";

import { Actions, Wrapper } from "./ExtensionForm.styles";
import { useSip } from "./useSip";

export default function ExtensionForm() {
  const [extensionName, setExtensionName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { status, connect, disconnect } = useSip();

  const handleConnect = () => {
    connect({
      username: extensionName,
      password: password,
      domain: "usads.dentcomm.ai",
    });
  };

  const handleCancel = async () => {
    await disconnect();
    setExtensionName("");
    setPassword("");
  };

  return (
    <Wrapper>
      <TextField
        label="Extension Name"
        value={extensionName}
        onChange={(e) => setExtensionName(e.target.value)}
        fullWidth
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      <div>Status: {status}</div>
      <Actions>
        <Button
          variant="contained"
          onClick={handleConnect}
          disabled={
            !extensionName.trim() ||
            !password ||
            status === "CONNECTING" ||
            status === "CONNECTED"
          }
          color="primary"
        >
          Connect
        </Button>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
      </Actions>
    </Wrapper>
  );
}
