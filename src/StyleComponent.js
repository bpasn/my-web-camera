import styled from "styled-components";

export const BoxContainer = styled.div`
    position: absolute;
    border: 1px solid red;
    width: 150px;
    opacity: 1;
    height: 150px;
    top: ${props => props.top}px;
    left: ${props => props.left}px;
    right: ${props => props.right}px;
    bottom: ${props => props.bottom}px;
 
  `