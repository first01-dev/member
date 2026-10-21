import * as React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { version } from '@/models/constant'
import { Button, InputBase, Typography } from '@mui/material'

export default function Prototype() {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography>Input</Typography>
      <div className="input">
        <InputBase placeholder="" className="input-base" />
      </div>
      <Button
        variant="contained"
        size="medium"
        style={{
          width: '98%',
          borderRadius: 10,
          margin: '2px',
        }}
      >
        ค้นหา
      </Button>
    </Box>
  )
}
