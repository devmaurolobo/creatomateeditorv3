import React from 'react';
import styled from 'styled-components';

export const TextInput = styled.textarea`
  display: block;
  margin: 5px 0;
  padding: 15px;
  width: 100%;
  height: 75px;
  border: 1px solidrgb(0, 104, 216);
  border-radius: 5px;
  outline: none;
  resize: none;

  &:focus {
    background: #e9f4fc;
    border-color: #005aff;
  }
`;
