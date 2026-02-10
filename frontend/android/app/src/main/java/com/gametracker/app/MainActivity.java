package com.gametracker.app;

import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startPythonServer();
    }

    private void startPythonServer() {
        new Thread(() -> {
            try {
                if (!Python.isStarted()) {
                    Python.start(new AndroidPlatform(this));
                }
                Python py = Python.getInstance();
                String dataDir = getFilesDir().getAbsolutePath();
                String clientId = BuildConfig.IGDB_CLIENT_ID;
                String clientSecret = BuildConfig.IGDB_CLIENT_SECRET;
                py.getModule("android_server").callAttr("start", dataDir, clientId, clientSecret);
            } catch (Exception e) {
                Log.e(TAG, "Python server error", e);
            }
        }, "python-server").start();
    }
}
