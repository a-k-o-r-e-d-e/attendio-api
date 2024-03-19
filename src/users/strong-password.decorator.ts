import { IsStrongPassword } from 'class-validator';

// function as a const
export const IsCustomStrongPassword = () => {
  // use decorator factory way
  return (target: object, key: string) => {
    // return a property decorator function
    IsStrongPassword(
      {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      },
      {
        message:
          'Your password is not strong enough. Password must be atleast 8 characters long, contain 1 lowercase character, 1 uppercase character and 1 number',
      },
    )(target, key); // call IsStrongPassword decorator
  };
};
