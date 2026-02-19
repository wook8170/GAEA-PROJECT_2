from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from plane.settings.storage import S3Storage

@csrf_exempt
def local_upload_view(request):
    if request.method == 'POST':
        file_obj = request.FILES.get('file')
        key = request.POST.get('key')
        if not file_obj or not key:
            return JsonResponse({"error": "Missing file or key"}, status=400)
        
        storage = S3Storage(request=request)
        success = storage.upload_file(file_obj, key)
        if success:
            return JsonResponse({"status": "success"}, status=201)
        return JsonResponse({"error": "Upload failed"}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

urlpatterns = [
    # 부모 urls.py에서 api/를 붙여줄 것이므로 여기서는 local-upload/만 사용
    path('local-upload/', local_upload_view, name='local-upload'),
]
