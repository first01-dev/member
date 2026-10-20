import { InputBase, InputBaseProps, Paper, Switch, TableCell, tableCellClasses, TableRow } from "@mui/material";
import { alpha, createTheme, styled } from "@mui/material/styles";
import * as Loading from '../public/images/Loading Dots Blue.json'
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { StepIconProps } from '@mui/material/StepIcon';
import * as React from 'react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
const defaultTheme = createTheme();

const settings = {
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  centerMode: true,
  centerPadding: "20px",
};

const loadingAnimation = {
  loop: true,
  autoplay: true,
  animationData: JSON.parse(JSON.stringify(Loading)), // clone ให้แก้ได้
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

const SelectInputBase = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== 'notched', // block notched
})<InputBaseProps>(({ theme }) => ({
  fontSize: '16px',
  backgroundColor: '#FFFFFF',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0, 0, 0, 0),
    paddingLeft: `calc(1em + ${theme.spacing(0)})`,
    transition: theme.transitions.create('width'),
  },
}))


const Item = styled(Paper)(({ theme }) => ({

  boxShadow:"none",
  ...theme.typography.body2,
  padding: theme.spacing(0),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const Android12Switch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main),
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));
const SearchStyle = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '15px',
  border: '1px solid #ccc',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },

  width: '100%',
  [theme.breakpoints.up('sm')]: {
   
    
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '100%',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));


const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
    ...theme.applyStyles('dark', {
      borderColor: theme.palette.grey[800],
    }),
  },
}));

const QontoStepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean }
}>(({ theme, ownerState }) => ({
  color: '#d9d9d9',
  display: 'flex',
  alignItems: 'center',
  height: 22,

  ...(ownerState.active && {
    color: '#1890ff', // กำลังทำ
  }),

  ...(ownerState.completed && {
    color: '#52c41a', // เสร็จแล้ว
  }),

  '& .QontoStepIcon-circle': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },

  '& .QontoStepIcon-completedIcon': {
    color: '#52c41a',
    fontSize: 18,
  },
}))

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#fff",
    color: theme.palette.primary.main,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
 
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,

  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  border:0,
 
}));

const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
  [`&.MuiStepConnector-vertical`]: {
    marginLeft: 0,
  },

  [`& .MuiStepConnector-lineVertical`]: {
    marginLeft: 65,
    borderLeftWidth: 1,
  },
}))


export { SelectInputBase,Item,settings ,Android12Switch,loadingAnimation,QontoStepIconRoot,SearchStyle,SearchIconWrapper,StyledInputBase, QontoConnector ,CustomStepConnector,VisuallyHiddenInput,StyledTableCell,StyledTableRow};