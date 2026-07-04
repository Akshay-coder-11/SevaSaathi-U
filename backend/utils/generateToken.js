import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_sevasaathi_90123';
  
  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  // Set HTTP-Only Cookie
  res.cookie('token', token, cookieOptions);

  return token;
};

export default generateToken;
