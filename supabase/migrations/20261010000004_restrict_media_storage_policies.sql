-- media 버킷 쓰기 권한 축소.
-- 기존: 누구나(비로그인 포함) 모든 파일을 업로드·수정·삭제·목록조회할 수 있었습니다.
-- 변경 후:
--   * 비로그인·회원: merch-designs/ 에 "새 파일 업로드"만 가능 (템플릿 굿즈 디자인)
--   * 회원: application-artworks/{내 user id}/ 업로드 (작가 입점 신청)
--   * 작가: artworks|artists|business-docs/{내 artist id}/ 업로드·덮어쓰기
--   * 관리자 화면: 서버(/api/admin/upload-url)가 service_role로 발급한 서명 URL로 업로드
--   * 삭제·전체 목록 조회: 브라우저에서 불가 (공개 URL로 파일 보기는 버킷이 public이라 그대로 가능)
-- 관리자 업로드를 서명 URL로 바꾼 앱 코드가 배포된 뒤에 적용하세요.
begin;

drop policy if exists "anyone can upload to the media bucket (phase 1, admin dashboard" on storage.objects;
drop policy if exists "anyone can update objects in the media bucket (phase 1, admin d" on storage.objects;
drop policy if exists "anyone can delete objects in the media bucket (phase 1, admin d" on storage.objects;
drop policy if exists "anyone can list objects in the media bucket (phase 1, admin das" on storage.objects;

create policy "media: anyone can upload new merch designs"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'merch-designs');

create policy "media: members upload own application artworks"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'application-artworks'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "media: members read own application artworks"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'application-artworks'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "media: artists upload to own folders"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] in ('artworks', 'artists', 'business-docs')
    and (storage.foldername(name))[2] = (select p.artist_id::text from public.profiles p where p.id = auth.uid())
  );

-- upsert(같은 경로 덮어쓰기, 예: 프로필 사진)에는 select + update 권한이 함께 필요합니다.
create policy "media: artists read own folders"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] in ('artworks', 'artists', 'business-docs')
    and (storage.foldername(name))[2] = (select p.artist_id::text from public.profiles p where p.id = auth.uid())
  );

create policy "media: artists overwrite own folders"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] in ('artworks', 'artists', 'business-docs')
    and (storage.foldername(name))[2] = (select p.artist_id::text from public.profiles p where p.id = auth.uid())
  )
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] in ('artworks', 'artists', 'business-docs')
    and (storage.foldername(name))[2] = (select p.artist_id::text from public.profiles p where p.id = auth.uid())
  );

commit;
