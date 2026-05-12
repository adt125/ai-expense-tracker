import LocalCafeRoundedIcon from "@mui/icons-material/LocalCafeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CommuteRoundedIcon from "@mui/icons-material/CommuteRounded";
import ShoppingBasketRoundedIcon from "@mui/icons-material/ShoppingBasketRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

export const iconMap = {
  Food: LocalCafeRoundedIcon,
  Shopping: ShoppingBasketRoundedIcon,
  Utilities: BoltRoundedIcon,
  Fuel: CommuteRoundedIcon,
  default: ShoppingBasketRoundedIcon,
  Rent: HomeRoundedIcon,
};

export const rangeConfig = {
  weekly: 7,
  monthly: 31,
  yearly: 365,
};

export const chartColors = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#F43F5E",
  "#0F766E",
];
export const paymentSourceColors = [
  "#38BDF8",
  "#34D399",
  "#FBBF24",
  "#FB7185",
  "#A78BFA",
];

export const dailySpendColors = {
  dark: "#38BDF8",
  light: "#6366F1",
};

export const categoryColors = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#F43F5E",
  "#0F766E",
];
export const lowerCardHeight = { xs: 400, lg: "calc(100vh - 515px)" };
