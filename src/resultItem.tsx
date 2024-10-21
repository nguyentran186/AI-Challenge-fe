import { Checkbox } from "@mui/material";
import React from "react";

export default function ResultItem({
  name,
  checked,
  setRemoveResult,
  setCheckedItems,
  onClick, // Add onClick prop here
}: {
  name: string;
  checked: boolean;
  setRemoveResult: React.Dispatch<React.SetStateAction<string[]>>;
  setCheckedItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onClick?: () => void; // Define the type for onClick
}) {
  const nameList = name.split("_");
  const path = `/data/keyframes_trans/${nameList[0]}/${nameList[1]}/${nameList[2]}.jpg`;

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
    <div onClick={onClick} style={{ cursor: "pointer" }}> {/* Set onClick handler */}
      <div style={{ width: "fit-content", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ position: "relative", width: 132, height: 80 }}>
          <img
            src={path}
            alt={name}
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
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering onClick of parent div
              setCheckedItems((prev) => ({ ...prev, [name]: !checked }));
            }}
          />
        </div>
        <p style={{ margin: 0, textAlign: "center", fontSize: 13 }}>{name}</p>
      </div>
    </div>
  );
}
