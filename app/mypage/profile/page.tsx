import ProfileEditForm from "@/components/ProfileEditForm";

export default function MyProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-8">
      <h1 className="mb-8 font-display text-2xl">내 정보 수정</h1>
      <ProfileEditForm />
    </div>
  );
}
