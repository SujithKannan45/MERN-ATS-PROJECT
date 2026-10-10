import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'candidate' | 'recruiter' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending';
export type AuthProvider = 'local' | 'google' | 'linkedin' | 'github';

export interface IRefreshTokenRecord {
  tokenHash: string;
  familyId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  accountStatus: AccountStatus;
  provider: AuthProvider;
  providerId?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  refreshTokens: IRefreshTokenRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordChangedAfterTokenIssued(jwtTimestamp: number): boolean;
}

export interface IUserModel extends Model<IUserDocument> {}

const refreshTokenSchema = new Schema<IRefreshTokenRecord>(
  {
    tokenHash: { type: String, required: true },
    familyId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: function (this: IUserDocument) {
        return this.provider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['candidate', 'recruiter', 'admin'],
        message: '{VALUE} is not a valid user role',
      },
      default: 'candidate',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    accountStatus: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'pending'],
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
      index: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'linkedin', 'github'],
      default: 'local',
      index: true,
    },
    providerId: {
      type: String,
      sparse: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });
userSchema.index({ 'refreshTokens.tokenHash': 1 }, { sparse: true });

// Pre-save hook: Hash password securely
userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000); // 1s before to avoid token timing race
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare plaintext password with hashed password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password was modified after JWT was signed
userSchema.methods.isPasswordChangedAfterTokenIssued = function (
  jwtTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
