import { Shield, Lock, Eye, MessageSquareMore } from "lucide-react";

const EncryptionBanner = () => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 relative overflow-hidden p-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Top Icon */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>

            {/* Main Circle */}
            <div className="relative w-28 h-28 rounded-3xl bg-base-100 border border-base-300 shadow-2xl flex items-center justify-center">
              <Shield className="w-14 h-14 text-primary" strokeWidth={2.5} />

              {/* Floating Lock */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg animate-bounce">
                <Lock className="w-5 h-5 text-primary-content" />
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight">
            End-to-End <span className="text-primary">Encrypted</span>
          </h2>

          <p className="mt-4 text-lg text-base-content/70 leading-relaxed max-w-md">
            Your private conversations stay between you and the recipient.
            Nobody else can read them — not even us.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">Private by Default</h3>
                <p className="text-base-content/60 mt-1">
                  Only you and the person you message can access your chats.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquareMore className="w-6 h-6 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">Secure Messaging</h3>
                <p className="text-base-content/60 mt-1">
                  Real-time messaging protected with advanced encryption.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-base-content/70">
              Secure Connection Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionBanner;