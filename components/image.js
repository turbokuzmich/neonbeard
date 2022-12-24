import NoPhotography from "@mui/icons-material/NoPhotography";
import { styled } from "@mui/material/styles";
import omit from "lodash/omit";

const Image = styled("img")``;

function SmartImage(props) {
  const { src } = props;

  if (src) {
    return <Image {...props} />;
  }

  return <NoPhotography {...omit(props, "src")} fontSize="inherit" />;
}

export default SmartImage;
