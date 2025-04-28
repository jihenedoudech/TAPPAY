import React, { useEffect } from 'react';
import styled from 'styled-components';
import Logo from './Logo';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUserThunk } from '../Redux/userSlice';
import { Button } from '../../utils/BaseStyledComponents';

// Styled Components
const Container = styled.div`
  margin: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`;

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  border-radius: 25px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
`;

const UserName = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;

const Header = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [user]);

  return (
    <Container>
      <Logo />
      <UserContainer>
        <Avatar>
          {user ? user.username.charAt(0).toUpperCase() : 'G'}
        </Avatar>
        <UserName>{user ? user.username : 'Guest'}</UserName>
      </UserContainer>
    </Container>
  );
};

export default Header;