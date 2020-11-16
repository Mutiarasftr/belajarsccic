<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RujukanController extends Controller
{
    public function index()
    {
    	// mengambil data dari table rujukan
    	$rujukan = DB::table('rujukan')->get();
 
    	// mengirim data rujukan ke view index
    	return view('index',['rujukan' => $rujukan]);
 
    }
}