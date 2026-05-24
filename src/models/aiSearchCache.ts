import mongoose from "mongoose";

const aiSearchCacheSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
    },
    normalizedQuery: {
      type: String,
      required: true,
      unique: true,
    },
    aiResult: {
      type: Object,
      required: true,
    },
    createdAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

aiSearchCacheSchema.index({ expiresAt: -1 }, { expireAfterSeconds: 0 });

const AiSearchCache = mongoose.model("AiSearchCache", aiSearchCacheSchema);

export default AiSearchCache;
