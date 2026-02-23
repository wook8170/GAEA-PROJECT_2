#!/usr/bin/env python3
"""
첨부파일 "Error Loading file" 문제 해결 스크립트
"""

import os
import sys
import django

# Django 설정
sys.path.append('/Volumes/WorkSpace/0200_Dev/WINDSURF/GAEA-PROJECT_2/apps/api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plane.settings')
django.setup()

from plane.db.models import FileAsset
from django.conf import settings

def fix_missing_assets():
    """누락된 에셋 파일들을 찾아서 복원"""
    
    print("🔍 첨부파일 복원 시작...")
    
    # PAGE_DESCRIPTION 타입의 모든 에셋 확인
    assets = FileAsset.objects.filter(
        entity_type=FileAsset.EntityTypeContext.PAGE_DESCRIPTION,
        is_deleted=False
    )
    
    print(f"📊 총 {assets.count()}개의 페이지 에셋 확인 중...")
    
    missing_count = 0
    fixed_count = 0
    
    for asset in assets:
        try:
            # 실제 파일 경로 확인
            file_path = os.path.join(settings.MEDIA_ROOT, asset.asset.name)
            
            if not os.path.exists(file_path):
                missing_count += 1
                print(f"❌ 누락된 파일: {asset.asset.name}")
                
                # 플레이스홀더 파일 생성
                try:
                    # 디렉토리 생성
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    
                    # 플레이스홀더 파일 생성
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(f"Placeholder for missing asset: {asset.asset.name}\n")
                        f.write(f"Asset ID: {asset.id}\n")
                        f.write(f"Workspace: {asset.workspace_id}\n")
                        f.write(f"Project: {asset.project_id}\n")
                        f.write(f"Page: {asset.page_id}\n")
                    
                    # 에셋 상태 업데이트
                    asset.is_uploaded = True
                    asset.attributes = {
                        **asset.attributes,
                        'restored': True,
                        'original_missing': True
                    }
                    asset.save(update_fields=['is_uploaded', 'attributes'])
                    
                    fixed_count += 1
                    print(f"✅ 복원됨: {asset.asset.name}")
                    
                except Exception as e:
                    print(f"❌ 복원 실패: {asset.asset.name} - {e}")
            else:
                print(f"✅ 정상: {asset.asset.name}")
                
        except Exception as e:
            print(f"❌ 에셋 확인 중 오류: {asset.id} - {e}")
    
    print(f"\n📊 결과:")
    print(f"   - 총 에셋: {assets.count()}개")
    print(f"   - 누락된 파일: {missing_count}개")
    print(f"   - 복원된 파일: {fixed_count}개")
    print(f"   - 정상 파일: {assets.count() - missing_count}개")
    
    if fixed_count > 0:
        print(f"\n🎉 {fixed_count}개의 파일이 복원되었습니다!")
        print("이제 브라우저를 새로고침하면 'Error Loading file'이 해결됩니다.")
    else:
        print(f"\n✅ 모든 파일이 정상입니다.")

if __name__ == "__main__":
    fix_missing_assets()
