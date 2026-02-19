# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import os
from django.core.files.storage import FileSystemStorage
from django.conf import settings

class S3Storage(FileSystemStorage):
    def __init__(self, request=None):
        location = "/code/media"
        if not os.path.exists(location):
            os.makedirs(location, exist_ok=True)
                
        base_url = "/media/"
        super().__init__(location=location, base_url=base_url)
        self.request = request

    def generate_presigned_post(self, object_name, file_type, file_size, expiration=None):
        host = self.request.get_host() if self.request else "localhost:8000"
        return {
            "url": f"http://{host}/api/local-upload/", 
            "fields": {
                "key": object_name.lstrip('/'), # 앞쪽 슬래시 제거
                "Content-Type": file_type
            }
        }

    def generate_presigned_url(self, object_name, expiration=None, http_method="GET", disposition="inline", filename=None):
        host = self.request.get_host() if self.request else "localhost:8000"
        # 경로에서 중복된 슬래시와 media/ 중복을 철저히 제거
        clean_name = str(object_name).replace('/media/', '').lstrip('/')
        return f"http://{host}/media/{clean_name}"

    def get_object_metadata(self, object_name):
        return {
            "ContentType": "image/jpeg",
            "ContentLength": self.size(object_name) if self.exists(object_name) else 0,
        }

    def upload_file(self, file_obj, object_name: str, content_type: str = None, extra_args: dict = {}) -> bool:
        try:
            clean_name = str(object_name).lstrip('/')
            if self.exists(clean_name):
                self.delete(clean_name)
            self.save(clean_name, file_obj)
            return True
        except Exception as e:
            return False

    def copy_object(self, object_name, destination_key):
        try:
            src = str(object_name).lstrip('/')
            dst = str(destination_key).lstrip('/')
            if self.exists(src):
                with self.open(src) as f:
                    self.save(dst, f)
            return True
        except Exception:
            return False

    def delete_files(self, object_names):
        for name in object_names:
            target = str(name).lstrip('/')
            if self.exists(target):
                self.delete(target)
        return True
