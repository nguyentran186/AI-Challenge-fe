import { Checkbox } from "@mui/material";
import React from "react";

export default function ResultItem({
  name,
  checked,
  setRemoveResult,
  setCheckedItems,
}: {
  name: string;
  checked: boolean;
  setRemoveResult: React.Dispatch<React.SetStateAction<string[]>>;
  setCheckedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const nameList = name.split("_");
  const path = `Keyframes_${nameList[0]}/${nameList[0]}_${nameList[1]}/${nameList[2]}.jpg`;

  React.useEffect(() => {
    if (checked) {
      setRemoveResult((prev) => {
        const cpy = [...prev];
        if (!cpy.includes(name)) {
          cpy.push(name);
        }
        return cpy;
      });
    } else {
      setRemoveResult((prev) => {
        const cpy = [...prev];
        return cpy.filter((item) => item !== name);
      });
    }
  }, [checked]);

  return (
    <a href="https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg" target="_blank">
      <div style={{ width: "fit-content", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ position: "relative", width: 132, height: 80 }}>
          <img
            src="https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg"
            // Thay src bằng path ảnh!!!!
            alt="123"
            style={{ width: 132, height: 80, borderRadius: 8 }}
          />
          <Checkbox
            sx={{
              color: "black",
              "&.Mui-checked": {
                color: "black",
              },
            }}
            style={{
              position: "absolute",
              left: 4,
              top: 4,
              padding: 0,
              borderRadius: 6,
            }}
            checked={checked}
            onClick={() => setCheckedItems((prev) => ({ ...prev, [name]: !checked }))}
          />
        </div>
        <p style={{ margin: 0, textAlign: "center", fontSize: 13 }}>{name}</p>
      </div>
    </a>
  );
}
