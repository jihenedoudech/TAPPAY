import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const DetailsUndoMenu = ({ selectedItem, handleViewDetails, handleUndo }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls={`menu-${selectedItem.id}`}
        aria-haspopup="true"
        onClick={(event) =>
          setAnchorEl({ id: selectedItem.id, anchorEl: event.currentTarget })
        }
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id={`menu-${selectedItem.id}`}
        anchorEl={anchorEl?.id === selectedItem.id ? anchorEl?.anchorEl : null}
        open={Boolean(anchorEl?.id === selectedItem.id)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleViewDetails(selectedItem);
            handleMenuClose();
          }}
        >
          Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUndo(selectedItem);
            handleMenuClose();
          }}
        >
          Undo
        </MenuItem>
      </Menu>
    </>
  );
};

export default DetailsUndoMenu;
