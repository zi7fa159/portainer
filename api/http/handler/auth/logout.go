package auth

import (
	"net/http"
	"time"

	"github.com/portainer/portainer/api/http/security"
	"github.com/portainer/portainer/api/internal/logoutcontext"
	httperror "github.com/portainer/portainer/pkg/libhttp/error"
	"github.com/portainer/portainer/pkg/libhttp/response"
	"github.com/rs/zerolog/log"
)

// @id Logout
// @summary Logout
// @description **Access policy**: public
// @security ApiKeyAuth
// @security jwt
// @tags auth
// @success 204 "Success"
// @failure 500 "Server error"
// @router /auth/logout [post]

func (handler *Handler) logout(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	tokenData, err := security.RetrieveTokenData(r)
	if err != nil {
		log.Warn().Err(err).Msg("unable to retrieve user details from authentication token")
	}

	if tokenData != nil {
		handler.KubernetesTokenCacheManager.RemoveUserFromCache(tokenData.ID)
		logoutcontext.Cancel(tokenData.Token)
	}

	http.SetCookie(w, &http.Cookie{
		Name:     security.CookieKey,
		Value:    "",
		Expires:  time.Unix(0, 0),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})

	return response.Empty(w)
}
