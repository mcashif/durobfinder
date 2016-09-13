from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from drvfinder.models import Snippet,Driver
from django.shortcuts import get_object_or_404, render
from drvfinder.serializers import SnippetSerializer
import json
import datetime

# Create your views here.

def cloc(request,lat,lng,name):
    obj=Snippet(lattitude=lat,longitude=lng,title=name)
    obj.save()
    return HttpResponse("Done")

def index(request):
    objDriver=Driver.objects.all
    return render(request, 'drvfinder/index.html', {'objDriver': objDriver})

def getjson(request):

    dataX={}
    DataM = []
    driver=Driver.objects.all()
    count=1
    for drv in driver:
        obj=Snippet.objects.filter(title=str(drv.id))
        data={}
        data['id'] = count
        count+=1
        data['title'] = drv.driver_name
        data['category'] = "real_estate"
        data['date'] = obj[0].created.strftime('%Y-%m-%d')
        data['time'] = obj[0].created.strftime('%H:%M:%S')
        data['latitude'] = float(obj[0].lattitude)
        data['longitude'] = float(obj[0].longitude)
        data['picture'] = drv.driver_picture.url
        DataM.append(data)

    dataX['data']=DataM
    json_data = json.dumps(dataX)
    return HttpResponse(json_data, content_type='json')


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@csrf_exempt
def snippet_list(request):

    """
    List all code snippets, or create a new snippet.
    """
    if request.method == 'GET':
        snippets = Snippet.objects.all()
        serializer = SnippetSerializer(snippets, many=True)
        return JSONResponse(serializer.data)

    elif request.method == 'POST':
        today = datetime.datetime.today()
        Snippet.objects.filter(created__lte=today-datetime.timedelta(days=5)).delete()
        data = JSONParser().parse(request)
        serializer = SnippetSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)


@csrf_exempt
def snippet_detail(request, pk):
    """
    Retrieve, update or delete a code snippet.
    """
    try:
        snippet = Snippet.objects.get(pk=pk)
    except Snippet.DoesNotExist:
        return HttpResponse(status=404)

    if request.method == 'GET':
        serializer = SnippetSerializer(snippet)
        return JSONResponse(serializer.data)

    elif request.method == 'PUT':
        data = JSONParser().parse(request)
        serializer = SnippetSerializer(snippet, data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data)
        return JSONResponse(serializer.errors, status=400)

    elif request.method == 'DELETE':
        snippet.delete()
        return HttpResponse(status=204)
